// An old and a new seed-list file compared (ENG-26k): same seeds in the same order, which packed plans changed, which seeds fell back to
// another roll. usage: npx tsx eng26k/cmp.mts <old seeds-<stage>.ts> <new seeds-<stage>.ts>
const a: any = (await import(process.argv[2])).LIST, b: any = (await import(process.argv[3])).LIST;
console.log('seeds same order', JSON.stringify(a.seeds) === JSON.stringify(b.seeds), a.seeds.length, b.seeds.length);
const d = a.plans.map((p: string, i: number) => p !== b.plans[i] ? a.seeds[i] : 0).filter(Boolean);
console.log('plans changed', d.length, 'unchanged', a.plans.length - d.length, 'changed seeds:', d.join(','));
console.log('plan seed tag differs from list seed (fallback rolls):', b.plans.map((p: string, i: number) => +p.split(':')[0] !== b.seeds[i] ? `${b.seeds[i]}->${p.split(':')[0]}` : '').filter(Boolean).join(' '));
