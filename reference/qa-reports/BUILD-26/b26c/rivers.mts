const [root, setting, seedS] = process.argv.slice(2);
await import(root + '/src/game/headlessDom.ts');
const { setDifficulty } = await import(root + '/src/game/difficulty.ts'); setDifficulty(setting as never);
const { RealPlay } = await import(root + '/src/game/realPlay.ts');
const r: any = new RealPlay('2-6', Number(seedS));
for (const v of r.stage.rivers ?? []) console.log(`river x ${Math.round(v.x0)}-${Math.round(v.x1)} surfaceY ${Math.round(v.surfaceY)} safe ${!!v.safe} pond ${!!v.wheelPond}`);
