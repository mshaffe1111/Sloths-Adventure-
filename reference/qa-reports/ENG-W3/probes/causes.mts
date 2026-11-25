// going down: each castBots rescue (stuck spot) split by where it stands on its own roll, x only (rows carry no y): 'slot' (within
// 30 px of a slot's gap: two solid pieces within 8 px in height, 22-65 px apart, tower.ts SLOT), 'vine' (within 48 px of a climb
// vine's x: ENG-DARK-f's way-down vine-top shape, firsttimer.ts:2859, may be among these) or 'rest'. A spot near both counts 'slot'.
// TREE= the lay the rows ran on; ROWS= the rows files (comma-separated). ENG-DOWNBOT box 10 (the lead: judge the no-slot rule on
// the slot causes)
const T = process.env.TREE!;
await import(`${T}/src/game/headlessDom.ts`);
const { readyDraft } = await import(`${T}/tools/engine/draft.ts`);
const { generateAllLevels } = await import(`${T}/src/game/worldsData.ts`);
const { buildGen2Stage } = await import(`${T}/src/game/gen2/pipeline.ts`);
const { LISTED } = await import(`${T}/src/game/gen2/listed.ts`);
const fs = await import('node:fs');
readyDraft('3-1');
const cfg = generateAllLevels().find((c: any) => c.id === '3-1' && !c.secret)!;
const rows = process.env.ROWS!.split(',').flatMap((f) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l)));
const memo = new Map<string, { slots: [number, number][]; vines: number[] }>();
const at = (set: string, seed: number) => {
  const k = `${set}${seed}`;
  if (!memo.has(k)) {
    const st: any = buildGen2Stage({ config: cfg, kit: LISTED['3-1'].kit(), seed, difficulty: set });
    const ps = st.platforms.filter((q: any) => q.type === 'solid' && !q.broken);
    const slots: [number, number][] = [];
    for (const a of ps) for (const b of ps) { const gap = b.x - (a.x + a.width); if (Math.abs(a.y - b.y) <= 8 && gap > 21 && gap < 66) slots.push([a.x + a.width, b.x]); }
    memo.set(k, { slots, vines: st.vines.filter((v: any) => v.vineType === 'tree_climb').map((v: any) => v.x) });
  }
  return memo.get(k)!;
};
const tally: Record<string, Record<string, number>> = {};
for (const r of rows) {
  const k = `${r.bot} ${r.setting}`; tally[k] ??= { rows: 0, rescues: 0, slot: 0, vine: 0, rest: 0 }; tally[k].rows++; tally[k].rescues += r.rescues;
  const m = at(r.setting, r.seed);
  for (const s of r.stuck) {
    const c = m.slots.some(([a, b]) => s.x >= a - 30 && s.x <= b + 30) ? 'slot' : m.vines.some((v) => Math.abs(v - s.x) <= 48) ? 'vine' : 'rest';
    tally[k][c]++;
    // (PRINT=<cause> lists each spot of that cause: bot, setting, seed, x and what the bot read there)
    if (process.env.PRINT === c) console.log(`  ${k} ${r.seed} x ${s.x}: ${s.what}`);
  }
}
const all = { rows: 0, rescues: 0, slot: 0, vine: 0, rest: 0 } as Record<string, number>;
for (const [k, t] of Object.entries(tally).sort()) { console.log(k.padEnd(14), Object.entries(t).map(([a, b]) => `${a} ${b}`).join('  ')); for (const a in t) all[a] += t[a]; }
console.log('all'.padEnd(14), Object.entries(all).map(([a, b]) => `${a} ${b}`).join('  '));
