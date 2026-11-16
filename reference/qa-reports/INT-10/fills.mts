// INT-10: each pickup socket of a stage's sections: how often it was filled (gen2.fills) of the times its section was laid, layouts 1-N
const root = process.argv[2]; const id = process.argv[3] ?? '1-6'; const diff = (process.argv[4] ?? 'normal') as any; const N = +(process.argv[5] ?? 5);
await import(`${root}/src/game/headlessDom.ts`);
const { generateStage, setLayoutVariant } = await import(`${root}/src/game/stageGenerator.ts`);
const { generateAllLevels } = await import(`${root}/src/game/worldsData.ts`);
const { isPetal } = await import(`${root}/src/game/petals.ts`);
const filled = new Map<string, number>(); const laid = new Map<string, number>(); let pet = 0, scr = 0;
for (let v = 1; v <= N; v++) {
  setLayoutVariant(v);
  const st: any = generateStage({ ...generateAllLevels().find((l: any) => l.id === id)!, unlocked: true }, diff);
  setLayoutVariant(null);
  pet += st.collectibles.filter((c: any) => isPetal(c, st)).length; scr += (st.exitTotemX - st.spawnX) / 440;
  for (const p of st.meta.pieces) laid.set(p.k, (laid.get(p.k) ?? 0) + 1);
  for (const f of st.gen2.fills ?? []) if (f.role === 'pickup') { const k = `${f.section.replace(/#.*$/, '').replace(/-\d+$/, '')}:${f.socket}`; filled.set(k, (filled.get(k) ?? 0) + 1); }
}
console.log(`${id} ${diff}: ${(pet / scr).toFixed(2)} petals a screen; ${pet} petals, ${N} layouts`);
for (const [k, n] of [...filled].sort()) console.log(`  ${k} filled ${n}`);
console.log('laid sections:', [...laid].map(([k, n]) => `${k} x${n}`).join(', '));
