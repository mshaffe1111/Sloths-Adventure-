const root = process.argv[2];
const { RealPlay } = await import(root + '/src/game/realPlay.ts');
for (const id of ['2-4', '2-5', '2-6']) for (const diff of ['normal', 'easy']) {
  const { setDifficulty } = await import(root + '/src/game/difficulty.ts'); setDifficulty(diff as never);
  const r = new RealPlay(id, 1) as any;
  const s = r.stage;
  const hf = (s.heartFalls ?? []);
  console.log(id, diff, JSON.stringify({ hearts: s.collectibles.filter((c: any) => c.type === 'heart').length, enemies: s.enemies.length, waterY: s.waterY, hardFalls: hf.filter((z: any) => !z.soft).length, softFalls: hf.filter((z: any) => z.soft).length, deadly: (s.proto?.water ?? []).filter((z: any) => z.kind === 'deadly').length, rivers: (s.rivers ?? []).length, pit: s.gen2?.budget?.pit, flags: (s.checkpoints ?? []).length, thorns: (s.hazards ?? []).length, unsafeRivers: (s.rivers ?? []).filter((v: any) => !v.safe).map((v: any) => [Math.round(v.x0 ?? v.x ?? 0), Math.round(v.x1 ?? 0), Math.round(v.surfaceY ?? v.y ?? 0)]) }));
}
