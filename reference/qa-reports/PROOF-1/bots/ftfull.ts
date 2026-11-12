// PROOF-1: one first-timer run, full output (no wall-clock ms), for diffing head vs main.  npx tsx ftfull.ts <repoRoot> <id> <easy|normal> [seed]
const [root, id, setting, seedS] = process.argv.slice(2);
const ft = await import(root + '/tools/inspect/firsttimer.ts');
const who = setting === 'easy' ? ft.FT_KID : ft.FT_ADULT;
const r = ft.firstTimer(id, Number(seedS ?? 1), who, { fresh: true }) as Record<string, unknown>;
delete r.ms;
console.log(JSON.stringify(r, null, 1));
