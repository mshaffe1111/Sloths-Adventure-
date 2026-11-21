const [root, setting, seedS] = process.argv.slice(2);
await import(root + '/src/game/headlessDom.ts');
const { setDifficulty } = await import(root + '/src/game/difficulty.ts'); setDifficulty(setting as never);
const { RealPlay } = await import(root + '/src/game/realPlay.ts');
const ft = await import(root + '/tools/inspect/firsttimer.ts');
const rt = await import(root + '/tools/inspect/route.ts').catch(() => null);
const r: any = new RealPlay('2-6', Number(seedS));
const fr = (rt as any)?.findRoute; if (!fr) { console.log('no findRoute at gen2/route.ts'); process.exit(); }
const route = fr(r.stage, [], {});
console.log('traced', route.traced, 'segs', route.segs?.length);
const near = route.segs.filter((g: any) => Math.min(g.y0, g.y1) <= 4330 && Math.max(g.y0, g.y1) >= 3950);
console.log(near.map((g: any) => `${g.kind} ${Math.round(g.x0)},${Math.round(g.y0)}->${Math.round(g.x1)},${Math.round(g.y1)}`).join(' | '));
