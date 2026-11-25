// scratch probe: rescues and stall spots per seed. TREE= BOTS=kid:normal,adult:normal SEEDS=1-8 GEN2_DRAFT=3-1 npx tsx <this>
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { firstTimer } = await import(`${T}/tools/inspect/firsttimer.ts`);
const { CAST_BOTS } = await import(`${T}/tools/inspect/castBots.ts`);
readyDraft('3-1');
const [a, b] = (process.env.SEEDS ?? '1-8').split('-').map(Number);
for (const bs of (process.env.BOTS ?? 'kid:normal').split(',')) {
  const [bot, set] = bs.split(':');
  for (let seed = a; seed <= (b ?? a); seed++) {
    const r: any = firstTimer('3-1', seed, CAST_BOTS[bot][set], { cap: 1200, dotSetting: true });
    console.log(`${bot} ${set} ${seed}: ${r.end} ${r.time}s R${r.rescues} | ${r.stuck.filter((s: any) => s.rescued).map((s: any) => `(${Math.round(s.x)},${Math.round(s.y)}) ${s.what.slice(0, 50)}`).join(' ; ')}`);
  }
}
